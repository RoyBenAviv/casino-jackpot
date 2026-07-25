import type { Account } from '@casino/shared'
import { accountRepository } from '../repositories/account-repository'

/**
 * Add credits to the account, creating it on first cash-out. The account has
 * no login — it is identified only by a long-lived anonymous cookie, so an
 * unknown/absent id simply starts a fresh account.
 */
export async function creditAccount(
  accountId: string | undefined,
  amount: number,
): Promise<Account> {
  const id = accountId ?? crypto.randomUUID()
  const account = (await accountRepository.get(id)) ?? { id, balance: 0 }

  account.balance += amount
  await accountRepository.save(account)
  return account
}
