export type DataMsg = {
  type: 'joined',
  name: string,
  key: string
} | {
  type: 'queue'
} | {
  type: 'server'
};
