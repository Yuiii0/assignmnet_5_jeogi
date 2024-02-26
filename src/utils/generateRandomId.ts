import { customAlphabet } from 'nanoid';

export const RANDOM_ID_BASE =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const generateRandomId = customAlphabet(RANDOM_ID_BASE, 20);

export default generateRandomId;
