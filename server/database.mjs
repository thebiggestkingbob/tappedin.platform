import pg from 'pg';
import {X509Certificate} from 'node:crypto';
import {rootCertificates} from 'node:tls';
export function postgresSql(sql){let n=0,inQuote=false,out='';for(let i=0;i<sql.length;i++){const c=sql[i];if(c==="'"){out+=c;if(inQuote&&sql[i+1]==="'"){out+=sql[++i];continue}inQuote=!inQuote;continue}out+=c==='?'&&!inQuote?'$'+(++n):c}return out.replace(/json_extract\(([^()]+),'\$\.(version|approve|reply|read|edit|book|inbox)'\)/g,"(json_extract($1,'$.$2'))::integer").replace(/\b(json_extract|json_each|json_set|json_remove)\(/g,'tapped_internal.$1(')}
export function databaseAdapter(client,transaction){const statement=(source,values=[])=>({source,values,bind(...v){return statement(source,v.map(x=>x===undefined?null:x))},async first(){return (await client.query(postgresSql(source),values)).rows[0]||null},async all(){return {results:(await client.query(postgresSql(source),values)).rows}},async run(){const r=await client.query(postgresSql(source),values);return {meta:{changes:r.rowCount??r.affectedRows??0}}}});return {prepare:source=>statement(source),async batch(stmts){return transaction(async tx=>{const results=[];for(const s of stmts){const r=await tx.query(postgresSql(s.source),s.values);results.push({meta:{changes:r.rowCount??r.affectedRows??0}})}return results})}}}
export function databaseOptions(env=process.env){
 if(!env.DATABASE_URL)throw new Error('DATABASE_URL is not configured');
 let url;try{url=new URL(env.DATABASE_URL.trim());if(!['postgres:','postgresql:'].includes(url.protocol)||!url.hostname)throw new Error()}catch{throw new Error('DATABASE_URL must be a complete PostgreSQL connection URI')}
 // pg lets connection-string SSL options replace the explicit TLS object.
 // Keep certificate and hostname verification under server control.
 for(const key of [...url.searchParams.keys()])if(key==='ssl'||key.startsWith('ssl'))url.searchParams.delete(key);
 const ssl={rejectUnauthorized:true};
 if(env.SUPABASE_DB_CA_CERT){
  const pem=env.SUPABASE_DB_CA_CERT.replace(/\\n/g,'\n').trim();
  const certs=pem.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g);
  try{if(!certs?.length)throw new Error();for(const cert of certs)new X509Certificate(cert)}catch{throw new Error('SUPABASE_DB_CA_CERT must contain the downloaded PEM certificate')}
  ssl.ca=[...rootCertificates,...certs];
 }
 return {connectionString:url.toString(),max:3,idleTimeoutMillis:10000,connectionTimeoutMillis:10000,ssl,allowExitOnIdle:true};
}
let pool;
export function productionDatabase(){pool??=new pg.Pool(databaseOptions());return databaseAdapter(pool,async callback=>{const c=await pool.connect();try{await c.query('BEGIN');const result=await callback(c);await c.query('COMMIT');return result}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}})}
