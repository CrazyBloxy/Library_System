import React, { useState } from "react";

/* Forms */
import { StudentForm } from "./forms/StudentForm";
import { BorrowForm } from "./forms/BorrowForm";
import { ReturnForm } from "./forms/ReturnForm";

export const Home = () => {
    const [activeForm, setActiveForm] = useState<string | null>(null);

    {/* Closes Pop UI Forms */}
    const formsComponents: Record<string, React.ReactNode> = {
        student: <StudentForm onClose={() => setActiveForm(null)} />,
        borrow: <BorrowForm onClose={() => setActiveForm(null)} />,
        return: <ReturnForm onClose={() => setActiveForm(null)} />
    }

    return (
        <>
            {/* Opens Pop UI Forms */}
            <div className="flex flex-row gap-3 justify-center">
                <button onClick={() => setActiveForm("student")} className="btn btn-soft"> Student Sign Up </button>
                <button onClick={() => setActiveForm("borrow")} className="btn btn-soft"> Borrow </button>
                <button onClick={() => setActiveForm("return")} className="btn btn-soft"> Return </button>
            </div>

            {/* Checks if activeForms has a string */}
            {activeForm && (
                <div className="fixed bg-black/50 min-h-screen z-10 w-screen flex justify-center items-center top-0 left-0">
                    <div className="bg-info-content p-20 w-150">
                        <div className="flex flex-col gap-4">
                            {formsComponents[activeForm]}
                        </div>
                    </div>
                </div>
            )}
        </>

    );
};
