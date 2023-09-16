import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import "./feed.css";
import animationData from "../assets/Lotties/notfound.json";
import Lottie from "react-lottie";

const Feed = ({ setModalVisible, modalVisible, setJobDetails }) => {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [recruiterId, setRecruiterId] = useState("tahmid");
  const [jobs, setJobs] = useState([]);
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
  };
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        console.log("Fetching jobs from db", db);
        const jobCollection = await db
          .collection("recruiters")
          .doc(recruiterId)
          .collection("jobs")
          .get();

        console.log("Job collection", jobCollection);
        const fetchedJobs = jobCollection.docs.map((doc) => doc.data());
        console.log("Fetched jobs", fetchedJobs);
        setJobs(fetchedJobs);
        console.log("Jobs", jobs);
      } catch (error) {
        console.error("Could not fetch jobs", error);
      }
    };

    fetchJobs();
  }, [recruiterId]);

  const handleSubmit = async () => {
    const newJob = { jobTitle, jobDescription };

    try {
      // Use the jobTitle as the document ID when adding the job to Firestore
      await db
        .collection("recruiters")
        .doc(recruiterId)
        .collection("jobs")
        .doc(jobTitle) // Specify the jobTitle as the document ID
        .set(newJob);

      setJobs([...jobs, newJob]);
      setModalVisible(false);
      setJobDescription("");
      setJobTitle(""); // Clear jobTitle after submission
    } catch (error) {
      console.error("Error adding job", error);
    }
  };

  const [expandedCard, setExpandedCard] = useState(null);

  const toggleExpandedCard = (index) => {
    console.log("Clicked", index);
    if (expandedCard === index) {
      setExpandedCard(null);
    } else {
      setExpandedCard(index);
    }
  };

  const handleDeleteJob = async (jobTitleToDelete) => {
    try {
      // Delete the job from the "jobs" subcollection under the recruiter's document
      await db
        .collection("recruiters")
        .doc(recruiterId)
        .collection("jobs")
        .doc(jobTitleToDelete) // Use the jobTitle as the document ID to delete
        .delete();
      setJobs(jobs.filter((job) => job.jobTitle !== jobTitleToDelete));
    } catch (error) {
      console.error("Error deleting job", error);
    }
  };

  return (
    <div className="app">
      {/* Navbar */}

      {/* Main Content */}
      <div className="main-content">
        {/* Job Cards */}
        <div className="job-cards">
          {jobs.length > 0 ? (
            jobs.map((job, index) => (
              <JobCard
                job={job}
                index={index}
                toggleExpandedCard={toggleExpandedCard}
                expandedCard={expandedCard}
                setJobDetails={setJobDetails}
                handleDeleteJob={handleDeleteJob}
              />
            ))
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "5rem",
              }}
            >
              <Lottie options={defaultOptions} height={250} width={300} />
              <h2>
                You haven't added a job yet.{" "}
                <span
                  onClick={() => setModalVisible(true)}
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  Add a job{" "}
                </span>{" "}
                to get started
              </h2>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalVisible && (
        <JobInfoModal
          setjobTitle={setJobTitle}
          setJobDescription={setJobDescription}
          handleSubmit={handleSubmit}
          jobTitle={jobTitle}
          jobDescription={jobDescription}
          setModalVisible={setModalVisible}
        />
      )}
    </div>
  );
};

const JobCard = ({
  job,
  index,
  toggleExpandedCard,
  expandedCard,
  setJobDetails,
  handleDeleteJob,
}) => {
  return (
    <div
      key={index}
      className={`job-card ${expandedCard === index ? "expanded" : ""}`}
      onClick={() => setJobDetails(job)}
    >
      <div className="job-header">
        <button
          className="delete-button"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when clicking the delete button
            handleDeleteJob(job.jobTitle);
          }}
        >
          &#x2715;
        </button>
        <h3 className="job-title">{job.jobTitle}</h3>
      </div>
      <div className="job-description">
        <p>{job.jobDescription.substring(0, 200)}</p>
      </div>
    </div>
  );
};

const JobInfoModal = ({
  setjobTitle,
  setJobDescription,
  handleSubmit,
  jobTitle,
  jobDescription,
  setModalVisible,
}) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <h2 className="modal-title">Job Information</h2>

        <input
          type="text"
          className="modal-input"
          placeholder="Position Title"
          value={jobTitle}
          onChange={(e) => setjobTitle(e.target.value)}
        />

        <textarea
          className="modal-textarea"
          placeholder="Job Description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <div className="modal-buttons">
          <button
            className="modal-button submit-button"
            onClick={() => {
              // Implement your form submission logic here
              handleSubmit();
            }}
          >
            Submit
          </button>

          <button
            className="modal-button cancel-button"
            onClick={() => setModalVisible(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Feed;
