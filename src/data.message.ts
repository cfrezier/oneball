export type DataMsg = {
  type: 'joined',
  name: string,
  key: string
} | {
  type: 'queue',
  key: string
} | {
  type: 'server'
} | {
  type: 'input',
  input: number,
  key: string
};
