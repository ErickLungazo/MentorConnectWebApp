import React from 'react';
import EmploymentHistoryForm from "@/components/forms/EmploymentHistoryForm.tsx";
import EmploymentHistoryTable from "@/components/EmploymentHistoryTable.tsx";

const EmploymentHistoryScreen = () => {
    return (
        <div>
            <EmploymentHistoryForm/>
            <EmploymentHistoryTable/>
        </div>
    );
};

export default EmploymentHistoryScreen;