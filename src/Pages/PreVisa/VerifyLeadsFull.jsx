import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";

const VerifyLeadsFull = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [finalVisaManagers, setFinalVisaManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [managersLoading, setManagersLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  const { state } = useLocation();
  const navigate = useNavigate();
  const lead = state?.lead;
  const id = lead;

  // Check authentication
  useEffect(() => {
    if (!localStorage.getItem("PreVisaManager")) {
      navigate("/");
    }
  }, [navigate]);

  // Fetch client form details
  useEffect(() => {
    if (!state) {
      navigate("/verify-leads");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/client-form/getbyId/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, state]);

  // Fetch final visa managers
  const fetchFinalVisaManagers = async (searchQuery = "") => {
    setManagersLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/final-visa/`, {
        params: { search: searchQuery },
      });
      setFinalVisaManagers(response.data);
    } catch (err) {
      console.error("Error fetching final visa managers:", err);
    } finally {
      setManagersLoading(false);
    }
  };

  const handleFinalApply = () => {
    setShowModal(true);
    fetchFinalVisaManagers();
  };

  const handleModalApply = async () => {
    if (selectedManager) {
      setApplyLoading(true);
      try {
        const preVisaManagerId = localStorage.getItem("PreVisaManager");
        const clientFormId = id;
        const finalVisaManagerId = selectedManager._id;

        const res = await axios.put(
          `${API_URL}/api/client-form/transfer-to-finalvisa`,
          {
            clientFormId,
            preVisaManagerId,
            finalVisaManagerId,
          }
        );

        if (res.data.success) {
          toast.success("Transferred successfully 🎉");
          setShowModal(false);
          setSelectedManager(null);
          setData((prev) => ({
            ...prev,
            transferredToFinalVisaManager: true,
          }));
        } else {
          toast.error(res.data.message || "Something went wrong");
        }
      } catch (err) {
        console.error("API error:", err);
        toast.error("Server error while transferring");
      } finally {
        setApplyLoading(false);
      }
    } else {
      alert("Please select a Final Visa Manager");
    }
  };

  // Reject handler
  const handleReject = async (id) => {
    try {
      Swal.fire({
        title: "Are you sure?",
        text: "This form will be marked as rejected!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, Reject it!",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await axios.put(`${API_URL}/api/client-form/reject/${id}`);
          Swal.fire("Rejected!", "The form has been rejected successfully.", "success");
          toast.success(response.data.message || "Form rejected successfully");
          navigate("/verify-leads");
        }
      });
    } catch (error) {
      console.error("Error rejecting form:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to reject form",
        "error"
      );
    }
  };

  const modalFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => {
          setShowModal(false);
          setSelectedManager(null);
        }}
        className="p-button-text"
        disabled={applyLoading}
      />
      <Button
        label={applyLoading ? "Applying..." : "Apply"}
        icon={applyLoading ? "pi pi-spinner pi-spin" : "pi pi-check"}
        onClick={handleModalApply}
        autoFocus
        disabled={!selectedManager || applyLoading}
        loading={applyLoading}
      />
    </div>
  );

  if (!state) return null;
  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!data) return <div className="no-data">No data available</div>;

  const isTransferred = Boolean(data.transferredToFinalVisaManager);

  return (
    <div className="form-container">
      {/* HEADER */}
      <div className="form-header">
        <div className="company-info">
          <button
            className="back-button"
            style={{ padding: "7px 10px", cursor: "pointer", fontWeight: "bold" }}
            onClick={() => navigate("/verify-leads")}
          >
            ← Back to Leads
          </button>
          <h2>Chhaya International Pvt. Ltd.</h2>
          <p>LIG 2 Nehru Nagar Unnao</p>
          <p>Uttar Pradesh 209801</p>
          <p>Email: chhayainternationalpvtltd@gmail.com</p>
          <p>Contact No.: 8081478427</p>
        </div>
        <div className="client-images">
          <div className="image-box">
            <label>Client Photo:</label>
            <img
              src={data.photo || "/placeholder-user.jpg"}
              alt="Client"
              className="client-photo"
            />
          </div>
          <div className="image-box">
            <label>Client Signature:</label>
            <img
              src={data.Sign || "/placeholder-signature.png"}
              alt="Signature"
              className="client-signature"
            />
          </div>
        </div>
      </div>

      {/* TITLE */}
      <div className="form-title-section">
        <h3 className="form-title">Registration Form</h3>
        <div className="form-meta">
          <span className="form-date">
            <strong>Date:</strong> {new Date(data.createdAt).toLocaleDateString()}
          </span>
          <span className="form-reg-no">
            <strong>Registration No. :- </strong>
            {data.regNo}
          </span>
        </div>
      </div>

      {/* PERSONAL DETAILS */}
      <section className="form-section personal-details">
        <h4 className="section-title">• Personal Details</h4>
        <div className="form-grid">
          <div className="form-group"><label>Full Name:</label><div className="form-control">{data.fullName}</div></div>
          <div className="form-group"><label>Father's Name:</label><div className="form-control">{data.fatherName}</div></div>
          <div className="form-group"><label>Address:</label><div className="form-control">{data.address}</div></div>
          <div className="form-group"><label>State:</label><div className="form-control">{data.state}</div></div>
          <div className="form-group"><label>PIN Code:</label><div className="form-control">{data.pinCode}</div></div>
          <div className="form-group"><label>WhatsApp Number:</label><div className="form-control">{data.whatsAppNo}</div></div>
          <div className="form-group"><label>Family Number:</label><div className="form-control">{data.familyContact}</div></div>
          <div className="form-group"><label>Contact Number:</label><div className="form-control">{data.contactNo}</div></div>
          <div className="form-group full-width"><label>Email:</label><div className="form-control">{data.email}</div></div>
        </div>
      </section>

      {/* PASSPORT DETAILS */}
      <section className="form-section passport-details">
        <h4 className="section-title">• Passport Details</h4>
        <div className="form-grid">
          <div className="form-group"><label>Passport Number:</label><div className="form-control">{data.passportNumber}</div></div>
          <div className="form-group"><label>Date of Birth:</label><div className="form-control">{new Date(data.dateOfBirth).toLocaleDateString()}</div></div>
          <div className="form-group"><label>Passport Expiry Date:</label><div className="form-control">{new Date(data.passportExpiry).toLocaleDateString()}</div></div>
          <div className="form-group"><label>Nationality:</label><div className="form-control">{data.nationality}</div></div>
        </div>
      </section>

      {/* WORK DETAILS */}
      <section className="form-section work-details">
        <h4 className="section-title">• Work Details</h4>
        <div className="form-grid">
          <div className="form-group"><label>Occupation:</label><div className="form-control">{data.occupation}</div></div>
          <div className="form-group"><label>Place of Deployment:</label><div className="form-control">{data.placeOfEmployment}</div></div>
          <div className="form-group"><label>Last Experience:</label><div className="form-control">{data.lastExperience}</div></div>
          <div className="form-group"><label>Last Salary & Post Details:</label><div className="form-control">{data.lastSalaryPostDetails}</div></div>
          <div className="form-group"><label>Expected Salary:</label><div className="form-control">{data.expectedSalary}</div></div>
          <div className="form-group"><label>Medical Report:</label><div className="form-control">{data.medicalReport}</div></div>
          <div className="form-group"><label>Interview Status:</label><div className="form-control">{data.InterviewStatus}</div></div>
          <div className="form-group"><label>PCC Status:</label><div className="form-control">{data.pccStatus}</div></div>
        </div>
      </section>

      {/* OFFICE USE */}
      <section className="form-section office-use">
        <h4 className="section-title">• For Office Use Only</h4>
        <div className="form-grid">
          <div className="form-group"><label>Job Title:</label><div className="form-control">{data.officeConfirmation?.work?.jobTitle}</div></div>
          <div className="form-group"><label>Duty Time:</label><div className="form-control">{data.officeConfirmation?.work?.WorkTime}</div></div>
          <div className="form-group"><label>Salary:</label><div className="form-control">{data.officeConfirmation?.work?.salary}</div></div>
          <div className="form-group"><label>Country:</label><div className="form-control">{data.officeConfirmation?.country?.countryName}</div></div>
          <div className="form-group"><label>Description:</label><div className="form-control">{data.officeConfirmation?.work?.description}</div></div>
          <div className="form-group"><label>Service Charge:</label><div className="form-control">{data.officeConfirmation?.ServiceCharge}</div></div>
          <div className="form-group"><label>Medical Charge:</label><div className="form-control">{data.officeConfirmation?.MedicalCharge}</div></div>
        </div>
      </section>

      {/* FINAL APPLY OR MESSAGE */}
      <section className="form-section final-apply-section">
        {isTransferred ? (
          <div
            style={{
              textAlign: "center",
              marginTop: "1rem",
              fontWeight: "bold",
              color: "green",
              fontSize: "1.2rem",
            }}
          >
            ✅ File already transferred to Final Visa Manager — not rejectable.
          </div>
        ) : (
          <div
            className="final-apply-button-container"
            style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
          >
            <Button
              label="Final Apply for Visa"
              icon="pi pi-check"
              className="p-button-success"
              onClick={handleFinalApply}
              style={{ padding: "0.75rem 1.5rem", fontSize: "1.1rem" }}
            />
            <Button
              label="Reject"
              icon="pi pi-times"
              className="p-button-danger"
              onClick={() => handleReject(id)}
              style={{ padding: "0.75rem 1.5rem", fontSize: "1.1rem" }}
            />
          </div>
        )}
      </section>

      {/* MODAL */}
      <Dialog
        header="Select Final Visa Manager"
        visible={showModal}
        style={{ width: "50vw" }}
        footer={modalFooter}
        onHide={() => {
          setShowModal(false);
          setSelectedManager(null);
        }}
        closable={!applyLoading}
      >
        <div className="p-fluid">
          {managersLoading ? (
            <div
              className="loading-container"
              style={{ textAlign: "center", padding: "2rem" }}
            >
              <ProgressSpinner style={{ width: "50px", height: "50px" }} strokeWidth="4" />
              <p style={{ marginTop: "1rem", color: "#666" }}>
                Loading visa managers...
              </p>
            </div>
          ) : (
            <Dropdown
              value={selectedManager}
              options={finalVisaManagers}
              onChange={(e) => setSelectedManager(e.value)}
              optionLabel="name"
              filter
              filterBy="name"
              showClear
              placeholder="Select a Final Visa Manager"
              style={{ width: "100%" }}
              emptyMessage="No managers found"
              disabled={applyLoading}
            />
          )}
        </div>
      </Dialog>

      <ToastContainer />
    </div>
  );
};

export default VerifyLeadsFull;
