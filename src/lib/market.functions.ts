import { createServerFn } from '@tanstack/react-start';
import { getUaePrices } from './market';
export const getLivePrices = createServerFn({ method: 'GET' }).handler(() => getUaePrices());
