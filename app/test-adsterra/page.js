export default function TestAdsterra() {
  return (
    <main style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Adsterra Test</h1>
      <div dangerouslySetInnerHTML={{
        __html: `
<script>
  atOptions = {
    'key' : 'a4638a9f907475a8243f653a6e4bd7ad',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/a4638a9f907475a8243f653a6e4bd7ad/invoke.js"></script>
        `
      }} />
    </main>
  );
}
