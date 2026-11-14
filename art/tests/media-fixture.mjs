import { execFile, spawn } from 'node:child_process';
import { cp,mkdtemp,symlink,writeFile,readFile,rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
// Build the real media components in an unpublished, isolated Astro source tree.
export async function mediaFixture() {
  const root=fileURLToPath(new URL('../',import.meta.url));
  const directory=await mkdtemp(join(process.env.TMPDIR||tmpdir(),'jaromil-media-'));
  let server;
  const close=async()=>{
    if(server && server.exitCode===null){server.kill('SIGTERM');await new Promise(resolve=>server.once('exit',resolve));}
    await rm(directory,{recursive:true,force:true});
  };
  try{
    await cp(join(root,'src'),join(directory,'src'),{recursive:true,filter:path=>path!==join(root,'src/assets')});
    for(const name of ['src/assets','node_modules','public'])await symlink(join(root,name),join(directory,name),'dir');
    await cp(join(root,'package.json'),join(directory,'package.json'));
    const fixtureSource = await readFile(join(root,'tests/fixtures/media.astro'),'utf8');
    await writeFile(join(directory,'src/pages/media-fixture.astro'),fixtureSource.replaceAll('../../src/','../'));
    await writeFile(join(directory,'src/pages/it/media-fixture.astro'),fixtureSource.replaceAll('../../src/','../../'));
    await writeFile(join(directory,'astro.config.mjs'),`import config from ${JSON.stringify(new URL('../astro.config.mjs',import.meta.url).href)};\nexport default {...config,cacheDir:'./.cache/'};\n`);
    const {stdout,stderr}=await promisify(execFile)(process.execPath,[join(root,'node_modules/astro/astro.js'),'build'],{cwd:directory,env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'},maxBuffer:1024*1024});
    if(process.env.JAROMIL_MEDIA_FIXTURE_LOG)await writeFile(process.env.JAROMIL_MEDIA_FIXTURE_LOG,stdout+stderr);
    server=spawn(process.execPath,[join(root,'node_modules/astro/astro.js'),'preview','--host','127.0.0.1','--port','4324'],{cwd:directory,env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('media fixture preview did not become ready')),15000);
      server.on('exit',code=>{clearTimeout(timer);reject(new Error(`media fixture preview exited ${code}`));});
      server.stdout.on('data',chunk=>{if(chunk.toString().includes('4324')){clearTimeout(timer);resolve();}});
      server.on('error',error=>{clearTimeout(timer);reject(error);});
    });
    return{url:'http://127.0.0.1:4324/art/media-fixture/',close};
  }catch(error){await close();throw error;}
}
