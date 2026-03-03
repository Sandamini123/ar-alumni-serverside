const app = require("./app");
const { startWinnerJob } = require("./jobs/winnerJob");

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api-docs`);
  startWinnerJob();
});