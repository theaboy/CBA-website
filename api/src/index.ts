import app from './app';

const PORT = process.env.PORT ?? 3001;

app.listen(PORT, () => {
  console.log(`CBA API running on port ${PORT}`);
});
