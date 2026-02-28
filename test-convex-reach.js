const main = async () => {
    const url = 'https://keen-pelican-151.eu-west-1.convex.cloud/version';
    try {
        const r = await fetch(url);
        console.log('Reachability to Convex:', r.status, r.statusText);
        const text = await r.text();
        console.log('Response:', text);
    } catch (e) {
        console.error('Failed to reach Convex:', e);
    }
};
main();
