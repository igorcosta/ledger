import { z } from 'zod'
import { BranchesResultSchema, CheckoutResultSchema, SuccessResultSchema } from './shared-types'

export const branchIpcSchema = {
  'get-branches': {
    args: z.tuple([]),
    return: BranchesResultSchema,
  },
  'get-branches-basic': {
    args: z.tuple([]),
    return: BranchesResultSchema,
  },
  'get-branches-with-metadata': {
    args: z.tuple([]),
    return: BranchesResultSchema,
  },
  'checkout-branch': {
    args: z.tuple([z.string()]),
    return: CheckoutResultSchema,
  },
  'create-branch': {
    args: z.tuple([z.string(), z.boolean().optional()]),
    return: SuccessResultSchema,
  },
  'push-branch': {
    args: z.tuple([z.string().optional(), z.boolean().optional()]),
    return: SuccessResultSchema,
  },
  'checkout-remote-branch': {
    args: z.tuple([z.string()]),
    return: CheckoutResultSchema,
  },
  'pull-branch': {
    args: z.tuple([z.string()]),
    return: SuccessResultSchema,
  },
}
