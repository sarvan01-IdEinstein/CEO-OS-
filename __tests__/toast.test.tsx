import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast, useToastHelpers } from '@/app/components/ToastContext';

// Test component that uses toast
function TestComponent() {
    const { toasts } = useToast();
    const toast = useToastHelpers();

    return (
        <div>
            <button onClick={() => toast.success('Success message')}>Show Success</button>
            <button onClick={() => toast.error('Error message')}>Show Error</button>
            <div data-testid="toast-count">{toasts.length}</div>
        </div>
    );
}

describe('ToastContext', () => {
    it('renders without crashing', () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );
        expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
    });

    it('adds a success toast when button is clicked', () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Success'));
        expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    });

    it('adds an error toast when button is clicked', () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Error'));
        expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    });

    it('can add multiple toasts', () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Success'));
        fireEvent.click(screen.getByText('Show Error'));
        expect(screen.getByTestId('toast-count')).toHaveTextContent('2');
    });
});
