// Monday.com GraphQL API helpers
// Env vars: MONDAY_API_KEY, MONDAY_BOARD_ID
// Column IDs fetched below — update once confirmed via introspection query

const MONDAY_API = 'https://api.monday.com/v2';

async function query(gql, variables = {}) {
  const resp = await fetch(MONDAY_API, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${process.env.MONDAY_API_KEY}`,
      'API-Version':   '2024-01',
    },
    body: JSON.stringify({ query: gql, variables }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await resp.json();
  if (data.errors) throw new Error(`Monday error: ${JSON.stringify(data.errors)}`);
  return data.data;
}

// Create a new deal item when a proposal is generated
export async function createProposalItem({ merchantName, businessType, template, customRate, salesperson, proposalUrl }) {
  const boardId  = process.env.MONDAY_BOARD_ID;
  if (!boardId || !process.env.MONDAY_API_KEY) return null;

  // Column values — IDs confirmed via introspection (see getColumnIds below)
  // Update COLUMN_IDS once Monday credentials are set and columns confirmed
  const columnValues = JSON.stringify({
    [COLUMN_IDS.status]:      { label: 'Proposal Sent' },
    [COLUMN_IDS.phone]:       { phone: '', countryShortName: 'AU' },
    [COLUMN_IDS.source]:      { label: businessType },
    [COLUMN_IDS.salesperson]: { personsAndTeams: [] },
    [COLUMN_IDS.notes]:       `Template: ${template} | Rate: ${customRate || 'Standard'} | Link: ${proposalUrl}`,
  });

  const data = await query(`
    mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item(board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
        id
        name
      }
    }
  `, { boardId, itemName: merchantName, columnValues });

  return data?.create_item?.id || null;
}

// Update item status when proposal is opened / PDF downloaded
export async function updateProposalStatus(itemId, event) {
  if (!itemId || !process.env.MONDAY_API_KEY) return;
  const label = event === 'pdf_download' ? 'PDF Downloaded' : 'Proposal Opened';
  await query(`
    mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
      change_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) {
        id
      }
    }
  `, {
    boardId:  process.env.MONDAY_BOARD_ID,
    itemId:   String(itemId),
    columnId: COLUMN_IDS.status,
    value:    JSON.stringify({ label }),
  });
}

// Add an activity note to a Monday item
export async function addActivityNote(itemId, note) {
  if (!itemId || !process.env.MONDAY_API_KEY) return;
  await query(`
    mutation ($itemId: ID!, $value: String!) {
      create_update(item_id: $itemId, body: $value) { id }
    }
  `, { itemId: String(itemId), value: note });
}

// Run once after Monday credentials are set to discover column IDs
export async function getColumnIds() {
  const boardId = process.env.MONDAY_BOARD_ID;
  const data = await query(`
    query ($boardId: ID!) {
      boards(ids: [$boardId]) {
        name
        columns { id title type }
      }
    }
  `, { boardId });
  return data?.boards?.[0]?.columns || [];
}

// Update COLUMN_IDS after running getColumnIds() — set via Vercel env or hardcode here
const COLUMN_IDS = {
  status:      process.env.MONDAY_COL_STATUS      || 'status',
  phone:       process.env.MONDAY_COL_PHONE        || 'phone',
  source:      process.env.MONDAY_COL_SOURCE       || 'dropdown',
  salesperson: process.env.MONDAY_COL_SALESPERSON  || 'person',
  notes:       process.env.MONDAY_COL_NOTES        || 'text',
};
