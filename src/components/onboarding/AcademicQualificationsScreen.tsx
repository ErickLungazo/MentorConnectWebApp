import React from 'react';
import AcademicQualificationsForm from "@/components/forms/AcademicQualificationsForm.tsx";
import AcademicInformationTable from "@/components/AcademicInformationTable.tsx";

const AcademicQualificationsScreen = () => {
    return (
        <div>
            <AcademicQualificationsForm/>
            <AcademicInformationTable/>
        </div>
    );
};

export default AcademicQualificationsScreen;