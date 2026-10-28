import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
const db = new PGlite()
const sql = readFileSync(new URL('../scripts/016_sponsor_inquiries.sql', import.meta.url), 'utf8')
before(async () => {
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;')
  await db.exec(sql)
  await db.exec(sql)
})
after(async () => db.close())
test('migration is repeatable, RLS is enabled, and only the server can read/write inquiries', async () => {
  const { rows } = await db.query<any>(`select relrowsecurity,
    has_table_privilege('service_role', 'public.sponsor_inquiries', 'INSERT') as server_insert,
    has_table_privilege('service_role', 'public.sponsor_inquiries', 'SELECT') as server_select,
    has_table_privilege('anon', 'public.sponsor_inquiries', 'SELECT') as anon_read,
    has_table_privilege('authenticated', 'public.sponsor_inquiries', 'SELECT') as user_read
    from pg_class where oid='public.sponsor_inquiries'::regclass`)
  assert.deepEqual(rows[0], { relrowsecurity: true, server_insert: true, server_select: true, anon_read: false, user_read: false })
})
test('a saved inquiry remains recoverable when notification is pending; references cannot overwrite it', async () => {
  await db.exec(`set role service_role;
    insert into public.sponsor_inquiries (id,name,email,company,offer,message,source_page)
    values ('9088b49e-c6ed-4f7b-928f-9b05076ec393','Synthetic test','test@example.com','Test company','single_slot','Synthetic test only','sponsor');`)
  const { rows } = await db.query<any>('select message, notification_email_id, notification_accepted_at from public.sponsor_inquiries')
  assert.deepEqual(rows[0], { message: 'Synthetic test only', notification_email_id: null, notification_accepted_at: null })
  await assert.rejects(db.exec(`insert into public.sponsor_inquiries (id,name,email,company,offer,message)
    values ('9088b49e-c6ed-4f7b-928f-9b05076ec393','Other','other@example.com','Other','single_slot','Overwrite');`), /duplicate key/)
  await db.exec(`update public.sponsor_inquiries set notification_email_id='synthetic-provider-id', notification_accepted_at=now()
    where id='9088b49e-c6ed-4f7b-928f-9b05076ec393';`)
  const saved = (await db.query<any>('select message, notification_email_id from public.sponsor_inquiries')).rows
  assert.deepEqual(saved, [{ message: 'Synthetic test only', notification_email_id: 'synthetic-provider-id' }])
  await db.exec('reset role')
})
