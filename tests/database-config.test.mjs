import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import {rootCertificates} from 'node:tls';
import {databaseOptions} from '../server/database.mjs';
const url='postgresql://postgres.project:example%40password@pooler.example.com:6543/postgres';
await test('Supabase CA is retained by pg even when URI SSL options would override verification',()=>{
 const cert=rootCertificates[0];
 const options=databaseOptions({DATABASE_URL:url+'?sslmode=no-verify&ssl=false&application_name=tappedin',SUPABASE_DB_CA_CERT:cert});
 const client=new pg.Client(options);
 assert.equal(client.connectionParameters.ssl.rejectUnauthorized,true);
 assert.ok(client.connectionParameters.ssl.ca.includes(cert));
 assert.equal(client.connectionParameters.password,'example@password');
 assert.equal(new URL(options.connectionString).searchParams.has('sslmode'),false);
 assert.equal(new URL(options.connectionString).searchParams.get('application_name'),'tappedin');
});
await test('literal newline certificates work and TLS verification stays enabled without a custom CA',()=>{
 assert.deepEqual(databaseOptions({DATABASE_URL:url,SUPABASE_DB_CA_CERT:rootCertificates[0].replace(/\n/g,'\\n')}).ssl.ca,databaseOptions({DATABASE_URL:url,SUPABASE_DB_CA_CERT:rootCertificates[0]}).ssl.ca);
 assert.deepEqual(new pg.Client(databaseOptions({DATABASE_URL:url})).connectionParameters.ssl,{rejectUnauthorized:true});
});
await test('configuration rejects invalid certificates and URLs without exposing supplied secrets',()=>{
 assert.throws(()=>databaseOptions({DATABASE_URL:'SECRET_INVALID_URL'}),e=>!e.message.includes('SECRET_INVALID_URL')&&e.message.includes('complete PostgreSQL'));
 assert.throws(()=>databaseOptions({DATABASE_URL:url,SUPABASE_DB_CA_CERT:'NOT_A_CERTIFICATE'}),/downloaded PEM/);
});
