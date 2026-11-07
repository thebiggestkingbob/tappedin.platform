import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const office = readFileSync(new URL('../web/community.js', import.meta.url), 'utf8');

test('Office invoice status disclosure distinguishes manual record from payment processing', () => {
  assert.match(office, /Invoice status is recorded manually by the project owner/);
  assert.match(office, /Marking an invoice Paid does not verify or transfer funds/);
});

test('Printable invoice carries payment provenance disclosure', () => {
  assert.match(office, /function viewInvoice\(id\)/);
  assert.match(office, /invoice-payment-note/);
  assert.match(office, /TAPPED IN has not verified or processed this payment/);
});
