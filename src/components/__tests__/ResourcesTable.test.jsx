/* eslint-env jest */
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResourcesTable from '../ResourcesTable';
import api from '../../api/axiosConfig';

jest.mock('../../api/axiosConfig');

const mockResursi = [
    {
        id: 1,
        naziv: 'Konferencijska dvorana A',
        tip: 'prostor',
        opis: 'Velika dvorana',
        kapacitet: 50,
        status: 'aktivan'
    }
];

describe('ResourcesTable Komponenta', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Učitava i prikazuje popis resursa te otvara modal za dodavanje', async () => {
        api.get.mockResolvedValueOnce({ data: mockResursi });

        render(<ResourcesTable />);

        expect(screen.getByText(/Učitavanje resursa.../i)).toBeInTheDocument();

        // dohvaća sve elemente s tim nazivom (i opciju u filteru i ćeliju u tablici)
        await waitFor(() => {
            const elementi = screen.getAllByText('Konferencijska dvorana A');
            expect(elementi.length).toBeGreaterThan(0);
        });

        const gumbDodaj = screen.getByText('+ Dodaj novi resurs');
        fireEvent.click(gumbDodaj);

        expect(screen.getByRole('heading', { name: 'Dodaj novi resurs' })).toBeInTheDocument();
    });

});