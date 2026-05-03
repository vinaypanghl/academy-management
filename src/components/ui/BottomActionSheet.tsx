import React from 'react';
import { IonModal } from '@ionic/react';
import { X } from 'lucide-react';
import './BottomActionSheet.scss';

interface BottomActionSheetProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

const BottomActionSheet: React.FC<BottomActionSheetProps> = ({
    isOpen,
    title,
    onClose,
    children,
    className = '',
}) => (
    <IonModal
        isOpen={isOpen}
        onDidDismiss={onClose}
        className={`bottom-action-sheet ${className}`.trim()}
        backdropDismiss
        initialBreakpoint={1}
        breakpoints={[0, 1]}
    >
        <div className="bottom-action-sheet__body">
            <header className="bottom-action-sheet__header">
                <h2>{title}</h2>
                <button type="button" onClick={onClose} aria-label="Close">
                    <X size={18} strokeWidth={2.3} />
                </button>
            </header>
            {children}
        </div>
    </IonModal>
);

export default BottomActionSheet;
