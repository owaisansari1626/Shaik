import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useShortcuts = (handlers: {
    onNewTask?: () => void;
    onNewActivity?: () => void;
    closeModals?: () => void;
}) => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input or textarea
            if (
                document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA' ||
                document.activeElement?.tagName === 'SELECT'
            ) {
                if (e.key === 'Escape' && handlers.closeModals) {
                    handlers.closeModals();
                }
                return;
            }

            switch (e.key.toLowerCase()) {
                case 'n':
                    e.preventDefault();
                    handlers.onNewTask?.();
                    break;
                case 'a':
                    e.preventDefault();
                    handlers.onNewActivity?.();
                    break;
                case 't':
                    navigate('/app/tasks');
                    break;
                case 'c':
                    navigate('/app/calendar');
                    break;
                case 'd':
                    navigate('/app/dashboard');
                    break;
                case 'escape':
                    handlers.closeModals?.();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate, handlers]);
};
