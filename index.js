const app = require("express")();
const port = 8000;
const { User, Activity, LeaderBoard } = require("./mongoConnection");

// api: LeaderBoard Detail (with month and year)

app.get("/getLeaderBoardDetail", async (req, res) => {
  try {
    const { month, year } = req.query;
    const result = await LeaderBoard.findOne({ month, year });
    if (!result) {
      return res.status(404).json({ message: "not found!" });
    }
    const sortedResult = result.entries.sort(
      (a, b) => b.totalPoints - a.totalPoints
    );
    return res.status(200).json({ sortedResult });
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
  }
});

/// api: User detail with populating data from activity model.

app.get("/getUserDetails", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(userId).populate("Activity");
    if (!user) {
      return res.status(404).json({ message: "not found!" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
  }
});

// api: taking points from admin / manager

app.get("/addPoints", async (req, res) => {
  try {
    const { userId, activityId, points, month } = req.body;
    if (month < 1 || month > 12) {
      return res.status(400).json({ message: "invalid value" });
    }

    const user = await User.findById(userId);
    const activity = await Activity.findById(activityId);
    user.points += points;
    user.activities.push(activity);

    if (!user || !activity) {
      return res.status(404).json({ message: "Not Found" });
    }
    await user.save();
    res.status(200).json({ message: "Points added", user });
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
  }
});

app.listen(port, () => console.log(`Server is Up... Port : ${port}`));

// sample data inserting out DB
// app.get("/addExample", async (req, res) => {
//   try {
//     const activities = [
//       { name: "Completed Task", points: 10 },
//       { name: "Submitted Report", points: 20 },
//     ];

//     const createdActivities = await Activity.create(activities);

//     const users = [
//       {
//         name: "John Doe",
//         activities: createdActivities.map((activity) => activity._id),
//       },
//       {
//         name: "Jane Smith",
//         activities: createdActivities.map((activity) => activity._id),
//       },
//     ];

//     const createdUsers = await User.create(users);

//     for (const user of createdUsers) {
//       let totalPoints = 0;
//       for (const activityId of user.activities) {
//         const activity = await Activity.findById(activityId);
//         totalPoints += activity.points;
//       }
//       user.points = totalPoints;
//       await user.save();
//     }

//     const currentMonth = new Date().getMonth() + 1;
//     const currentYear = new Date().getFullYear();
//     const leaderboardEntry = {
//       month: currentMonth,
//       year: currentYear,
//       entries: createdUsers.map((user) => ({
//         user: user._id,
//         totalPoints: user.points,
//       })),
//     };

//     await LeaderBoard.create(leaderboardEntry);

//     res.status(200).json({ message: "Example data seeded successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });
