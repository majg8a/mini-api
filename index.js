const http = require("http").createServer();
const moment = require("moment");

const io = require("socket.io")(http, {
  cors: { origin: "*" },
});

let schedules = [...Array(25).keys()].map((el) => ({
  time: moment.utc("08:00:00", "hh:mm:ss").add(el * 30, "minutes"),
  motos: [...Array(8).keys()].map(() => null),
}));

io.on("connection", (socket) => {
  socket.on("schedule", (body) => {
    if (body) {
      console.log();
      schedules.map((schedule, i) => {
        const isTheSame = Boolean(
          schedule.motos.find((moto) => moto === socket.id)
        );

        schedule.motos = schedule.motos.map((moto, j) => {
          if (moto === socket.id) {
            moto = null;
          }

          if (
            body.id !== null &&
            moto === null &&
            body.id === i &&
            !isTheSame
          ) {
            moto = socket.id;
            body.id = null;
          }

          return moto;
        });
        return schedule;
      });
    }
    console.log("finished");
    io.emit("schedule", schedules);
  });

  socket.on("disconnect", (reason) => {
    schedules = schedules.map((schedule) => ({
      ...schedule,
      motos: schedule.motos.map((moto) => (moto === socket.id ? null : moto)),
    }));
    console.log(reason);
  });
});

http.listen(process.env.PORT || 3000, () => console.log("listening on http://localhost:8080"));
