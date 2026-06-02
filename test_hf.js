import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
let hfKey = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('VITE_HF_API_KEY=')) hfKey = line.split('=')[1].trim();
});

if (!hfKey) {
  console.log('No key found');
  process.exit(1);
}

const model = "mistralai/Mistral-7B-Instruct-v0.2";
console.log(`Using key: ${hfKey.substring(0, 5)}...`);

fetch(`https://api-inference.huggingface.co/models/${model}`, {
  headers: {
    Authorization: `Bearer ${hfKey}`,
    "Content-Type": "application/json",
  },
  method: "POST",
  body: JSON.stringify({
    inputs: "<s>[INST] Hello [/INST]",
  }),
})
.then(res => res.json().then(data => ({status: res.status, data})))
.then(console.log)
.catch(console.error);
