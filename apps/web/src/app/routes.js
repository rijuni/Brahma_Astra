export const BRAHMA_ROUTES = Object.freeze(['home','chat','research','documents','images','projects','memory','agents','notifications','settings','astra']);
export function normalizeRoute(value) { return BRAHMA_ROUTES.includes(value) ? value : 'home'; }
