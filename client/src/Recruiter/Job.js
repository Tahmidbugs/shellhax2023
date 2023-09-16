import React, { useState } from "react";
import { Bar } from "react-chartjs-2";

function JobPage({ jobDetails }) {
  const [githubUsername, setGithubUsername] = useState("");
  const [data, setData] = useState({
    labels: ["User1", "User2", "User3", "User4", "User5"],
    datasets: [
      {
        label: "% Match",
        data: [85, 72, 91, 68, 77],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
      },
    ],
  });

  const handleSubmit = () => {
    // Simulate appending new data
    const newData = {
      labels: [...data.labels, githubUsername], // Append the new username
      datasets: [
        {
          ...data.datasets[0],
          data: [...data.datasets[0].data, Math.floor(Math.random() * 100)], // Append random match percentage
          backgroundColor: [
            ...data.datasets[0].backgroundColor,
            `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
              Math.random() * 256
            )}, ${Math.floor(Math.random() * 256)}, 0.6)`, // Append a random background color
          ],
        },
      ],
    };

    // Update the state with the new data
    setData(newData);

    // Clear the input field
    setGithubUsername("");
  };

  return (
    <div className="job-page">
      <div className="job-details">
        <h2>{jobDetails.jobTitle}</h2>
        <p>{jobDetails.jobDescription}</p>
      </div>
      <div className="analytics">
        <h3>GitHub Username:</h3>
        <input
          type="text"
          value={githubUsername}
          onChange={(e) => setGithubUsername(e.target.value)}
        />
        <button onClick={handleSubmit}>Submit</button>
        <div className="bar-chart">
          {/* <Bar
            data={data}
            options={{
              maintainAspectRatio: false, // Prevent the chart from maintaining aspect ratio
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: "% Match",
                  },
                },
              },
            }}
          /> */}
        </div>
      </div>
    </div>
  );
}

export default JobPage;
