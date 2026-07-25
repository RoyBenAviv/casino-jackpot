import type { Account } from '@casino/shared'

/**
 * Storage seam for accounts — same pattern as SessionRepository.
 * A real DB is one new implementation of this interface.
 */
export interface AccountRepository {
  get(id: string): Promise<Account | undefined>
  save(account: Account): Promise<void>
}

function createInMemoryAccountRepository(): AccountRepository {
  const accounts = new Map<string, Account>()

  return {
    async get(id) {
      return accounts.get(id)
    },
    async save(account) {
      accounts.set(account.id, account)
    },
  }
}

export const accountRepository = createInMemoryAccountRepository()
