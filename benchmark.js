const reposList = Array.from({ length: 100 }, (_, i) => ({ repo: `repo${i}`, branch: 'master' }));

async function mockFetch(url) {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10)); // 10-60ms mock latency
  return { ok: true, json: async () => ({ tree: [] }) };
}

async function runUnbounded() {
  const start = performance.now();
  let maxConcurrent = 0;
  let currentConcurrent = 0;

  await Promise.all(
    reposList.map(async (item) => {
      currentConcurrent++;
      maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
      await mockFetch(`https://api.github.com/repos/${item.repo}/git/trees/${item.branch}`);
      currentConcurrent--;
    })
  );
  const end = performance.now();
  return { time: end - start, maxConcurrent };
}

async function runChunked() {
  const start = performance.now();
  let maxConcurrent = 0;
  let currentConcurrent = 0;

  const CONCURRENCY_LIMIT = 5;
  for (let i = 0; i < reposList.length; i += CONCURRENCY_LIMIT) {
    const chunk = reposList.slice(i, i + CONCURRENCY_LIMIT);
    await Promise.all(
      chunk.map(async (item) => {
        currentConcurrent++;
        maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
        await mockFetch(`https://api.github.com/repos/${item.repo}/git/trees/${item.branch}`);
        currentConcurrent--;
      })
    );
  }

  const end = performance.now();
  return { time: end - start, maxConcurrent };
}

async function main() {
  console.log("Running unbounded...");
  const unbounded = await runUnbounded();
  console.log(`Unbounded: ${unbounded.time.toFixed(2)}ms, Max Concurrent: ${unbounded.maxConcurrent}`);

  console.log("Running chunked...");
  const chunked = await runChunked();
  console.log(`Chunked: ${chunked.time.toFixed(2)}ms, Max Concurrent: ${chunked.maxConcurrent}`);
}

main();
