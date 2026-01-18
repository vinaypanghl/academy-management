import React, { useState } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonCheckbox,
    IonButton,
    IonToast,
} from "@ionic/react";
import { useMarkAttendanceMutation, useFetchTeacherStudentsQuery } from "../../../../redux/api/api";

const MarkAttendance: React.FC = () => {
    const [attendanceType, setAttendanceType] = useState<"ARRIVAL" | "DEPARTURE">("ARRIVAL");

    const [attendance, setAttendance] = useState<Record<string, boolean>>({});

    const [showToast, setShowToast] = useState(false);

    const class_name = "10";
    const class_section = "A";

    const { data: students = [] } = useFetchTeacherStudentsQuery({ class_name, class_section });

    const [markAttendance, { isLoading }] = useMarkAttendanceMutation();

    const submitAttendance = async () => {
        try {
            await markAttendance({
                class_name,
                class_section,
                attendance_type: attendanceType,
                students: students.map((s) => ({
                    student_id: s.id,
                    status: attendance[s.id] ? "PRESENT" : "ABSENT",
                })),
            }).unwrap();

            setShowToast(true);
            setAttendance({});
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Mark Attendance</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                {/* Arrival / Departure */}
                <IonSegment
                    value={attendanceType}
                    onIonChange={(e) =>
                        setAttendanceType(e.detail.value as any)
                    }
                >
                    <IonSegmentButton value="ARRIVAL">
                        <IonLabel>Morning</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="DEPARTURE">
                        <IonLabel>Evening</IonLabel>
                    </IonSegmentButton>
                </IonSegment>

                {/* Students */}
                <IonList>
                    {students.map((s) => (
                        <IonItem key={s.id}>
                            <IonLabel>
                                {s.first_name} {s.last_name}
                            </IonLabel>
                            <IonCheckbox
                                slot="end"
                                checked={attendance[s.id] || false}
                                onIonChange={(e) =>
                                    setAttendance({
                                        ...attendance,
                                        [s.id]: e.detail.checked,
                                    })
                                }
                            />
                        </IonItem>
                    ))}
                </IonList>

                <IonButton
                    expand="block"
                    onClick={submitAttendance}
                    disabled={isLoading}
                >
                    Submit Attendance
                </IonButton>

                <IonToast
                    isOpen={showToast}
                    message="Attendance marked successfully"
                    duration={2000}
                    onDidDismiss={() => setShowToast(false)}
                />
            </IonContent>
        </IonPage>
    );
};

export default MarkAttendance;
