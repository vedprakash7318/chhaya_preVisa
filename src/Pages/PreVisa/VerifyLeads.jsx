import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { ToastContainer, toast } from "react-toastify";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

function VerifyLeads() {
  const API_URL=import.meta.env.VITE_API_URL;
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(""); // typing value
  const [globalFilter, setGlobalFilter] = useState(""); // actual search term
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 0 });

  const preVisaManagerId = localStorage.getItem("PreVisaManager");
  const navigate = useNavigate();

     useEffect(() => {
      if (!localStorage.getItem('PreVisaManager')) {
        navigate('/')
      }
    })
  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/client-form/get-by-previsa/${preVisaManagerId}`,
        { params: { search: globalFilter } }
      );
      setForms(res.data.data || []);
      setTotalRecords(res.data.data?.length || 0);
    } catch (error) {
      toast.error("Failed to fetch forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, [lazyParams, globalFilter]);

  const handleView = (rowData) => {
    navigate("verify-leads-full", { state: { lead: rowData._id } });
  };

  const header = (
    <div
      className="previsa-header-container"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div className="previsa-header-left">
        <h2 className="previsa-page-title">Verify Client Forms</h2>
      </div>
      <div className="previsa-header-right" style={{ display: "flex", gap: "10px" }}>
        <InputText
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name or phone"
          className="previsa-search-box"
        />
        <Button
          label="Search"
          icon="pi pi-search"
          style={{width:"50%" }}

          onClick={() => setGlobalFilter(searchInput)} // trigger search
        />
      </div>
    </div>
  );

  return (
    <div className="previsa-container" style={{ padding: "20px" }}>
      <ToastContainer />
      {loading ? (
        <div
          className="previsa-spinner-container"
          style={{ textAlign: "center", marginTop: "50px" }}
        >
          <ProgressSpinner />
        </div>
      ) : (
        <div className="previsa-table-wrapper">
          {header}
          <DataTable
            value={forms.filter(
              (f) =>
                f.fullName?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                f.contactNo?.toLowerCase().includes(globalFilter.toLowerCase())
            )}
            paginator
            lazy
            rows={lazyParams.rows}
            first={lazyParams.first}
            onPage={(e) => setLazyParams(e)}
            totalRecords={totalRecords}
            responsiveLayout="scroll"
            emptyMessage="No forms found"
          >
            <Column field="fullName" header="Name" sortable />
            <Column field="passportNumber" header="Passport No." sortable />
            <Column field="contactNo" header="Phone" />
            <Column
              field="transferredForPreVisaBy.name"
              header="Transferred By (Staff Head)"
            />
            <Column
              field="transferredDate"
              header="Transferred Date"
              body={(rowData) =>
                rowData.transferredDate
                  ? new Date(rowData.transferredDate).toLocaleDateString()
                  : "-"
              }
            />
            <Column
              header="Action"
              body={(rowData) => (
                <Button
                  label="View"
                  icon="pi pi-eye"
                  onClick={() => handleView(rowData)}
                />
              )}
            />
          </DataTable>
        </div>
      )}
    </div>
  );
}

export default VerifyLeads;
