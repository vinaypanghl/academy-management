import React, { useEffect, useRef, useState } from 'react';
import { IonItem, IonLabel, IonList, IonSpinner, IonInput } from '@ionic/react';
import { ParentInput } from '../../../types';
import { useFetchParentsQuery } from '../../../redux/api/api';
import FormField from '../../fields/FormField';
import SelectField from '../../fields/SelectField';
import { RELATIONSHIP_OPTIONS } from '../../../utils/helper';

interface Props {
    selectedParent: ParentInput | null;
    setSelectedParent: (parent: ParentInput | null) => void;
    setOriginalParent: (parent: ParentInput | null) => void;
}

const ParentFields: React.FC<Props> = ({ selectedParent, setSelectedParent, setOriginalParent }) => {
    const [parentPhone, setParentPhone] = useState(selectedParent?.phone || '');
    const [filteredParents, setFilteredParents] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLIonInputElement>(null);
    const [openAbove, setOpenAbove] = useState(false);

    const { data: parents = [], isFetching } = useFetchParentsQuery();

    // Update selectedParent partially
    const updateParent = (updates: Partial<ParentInput>) => {
        if (!selectedParent) {
            setSelectedParent({ display_name: '', phone: '', relationship: 'Guardian', ...updates });
        } else {
            setSelectedParent({ ...selectedParent, ...updates });
        }
    };

    // Handle phone input
    const handleSearch = (e: CustomEvent) => {
        const value = e.detail.value || '';
        const normalized = value.replace(/\D/g, '');
        setParentPhone(normalized);
        updateParent({ phone: normalized });

        if (normalized.length >= 3) {
            // Filter parents containing phone
            const results = parents.filter(p =>
                p.phone?.includes(normalized)
            );
            setFilteredParents(results);
            setShowSuggestions(true);

            // ✅ Exact match auto-select
            const exactMatch = parents.find(p => p.phone === normalized);
            if (exactMatch) {
                selectParent(exactMatch);
            }
        } else {
            setFilteredParents(parents); // Show all if less than 3 digits
            setShowSuggestions(true);
        }
    };

    // Select a parent
    const selectParent = (parent: any) => {
        // Helper to normalize API relationship to RELATIONSHIP_OPTIONS
        const normalizeRelationship = (rel: string | undefined) => {
            if (!rel) return 'Guardian';
            const match = RELATIONSHIP_OPTIONS.find(
                opt => opt.value.toLowerCase() === rel.toLowerCase()
            );
            return match ? match.value : 'Guardian';
        };
    
        const relationship = normalizeRelationship(parent.parent_student_map?.[0]?.relationship);
    
        const selected: ParentInput = {
            id: parent.id,
            display_name: parent.display_name || '',
            phone: parent.phone || '',
            email: parent.email || '',
            address: parent.address || '',
            relationship,
        };
    
        console.log('Selected Parent:', selected);
    
        setSelectedParent(selected);
        setOriginalParent(selected);
        setParentPhone(parent.phone || '');
        setShowSuggestions(false);
    };
    

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Position dropdown
    useEffect(() => {
        if (showSuggestions && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdownHeight = Math.min(filteredParents.length * 50, 250);
            setOpenAbove(spaceBelow < dropdownHeight + 20);
        }
    }, [showSuggestions, filteredParents]);

    return (
        <div style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
            <IonLabel className="ion-padding">Parent Information</IonLabel>

            <div style={{ position: 'relative' }} ref={suggestionsRef}>
                <IonItem>
                    <IonInput
                        type="tel"
                        label="Phone Number"
                        labelPlacement="stacked"
                        placeholder="Enter phone to search or add new"
                        value={parentPhone}
                        onIonInput={handleSearch}
                        onFocus={() => {
                            if (parentPhone.length >= 1 && filteredParents.length > 0) setShowSuggestions(true);
                        }}
                        ref={inputRef}
                    />
                </IonItem>

                {showSuggestions && (
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            zIndex: 9999,
                            background: 'var(--ion-background-color, white)',
                            border: '1px solid var(--ion-color-light-shade, #ddd)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            maxHeight: 250,
                            overflowY: 'auto',
                            top: openAbove ? 'auto' : '100%',
                            bottom: openAbove ? '100%' : 'auto',
                        }}
                    >
                        <IonList>
                            {isFetching && (
                                <IonItem>
                                    <IonSpinner name="dots" />
                                    <IonLabel>Loading parents...</IonLabel>
                                </IonItem>
                            )}
                            {!isFetching && filteredParents.length === 0 && (
                                <IonItem>
                                    <IonLabel>No parent found</IonLabel>
                                </IonItem>
                            )}
                            {!isFetching &&
                                filteredParents.map((p, index) => {
                                    const relationship = p.parent_student_map?.[0]?.relationship || 'Guardian';
                                    return (
                                        <IonItem
                                            key={`${p.id}-${p.phone ?? index}`}
                                            button
                                            lines="none"
                                            onClick={() => selectParent(p)}
                                            style={{
                                                borderRadius: 8,
                                                margin: '4px 8px',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s',
                                            }}
                                            className="autocomplete-item"
                                        >
                                            <IonLabel>
                                                <strong>{p.display_name}</strong> — {p.phone} {relationship ? `(${relationship})` : ''}
                                            </IonLabel>
                                        </IonItem>
                                    );
                                })}
                        </IonList>
                    </div>
                )}
            </div>

            {/* Other fields */}
            <FormField
                name="display_name"
                label="Parent's Name"
                placeholder="Enter parent's name"
                value={selectedParent?.display_name || ''}
                onIonChange={e => updateParent({ display_name: e.detail.value || '' })}
            />
            <FormField
                name="email"
                label="Email (optional)"
                placeholder="Enter email"
                value={selectedParent?.email || ''}
                onIonChange={e => updateParent({ email: e.detail.value || '' })}
            />
            <FormField
                name="address"
                label="Parent address"
                placeholder="Enter parent address"
                value={selectedParent?.address || ''}
                onIonChange={e => updateParent({ address: e.detail.value || '' })}
            />
            <SelectField
                name="relationship"
                label="Relationship (optional)"
                placeholder="Select relationship"
                value={selectedParent?.relationship || ''}
                options={RELATIONSHIP_OPTIONS}
                onIonChange={e => updateParent({ relationship: e.detail.value || 'Guardian' })}
            />
        </div>
    );
};

export default ParentFields;
