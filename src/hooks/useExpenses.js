import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { startOfDay, startOfWeek, startOfMonth } from '../utils/dateHelpers.js';

function toRow(expense, userId) {
  return {
    user_id:         userId,
    amount:          expense.amount,
    original_amount: expense.originalAmount ?? expense.amount,
    currency:        expense.currency ?? 'EUR',
    category:        expense.category,
    subcategory:     expense.subcategory,
    description:     expense.description,
    raw_text:        expense.rawText ?? '',
    date:            expense.date,
  };
}

function fromRow(row) {
  return {
    id:             row.id,
    amount:         Number(row.amount),
    originalAmount: Number(row.original_amount),
    currency:       row.currency,
    category:       row.category,
    subcategory:    row.subcategory,
    description:    row.description,
    rawText:        row.raw_text,
    date:           row.date,
  };
}

export function useExpenses(userId) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [dbError, setDbError]   = useState(null);

  const fetchExpenses = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) {
      console.error('[GastoLens] Error al cargar gastos:', error.message, error);
      setDbError(error.message);
    } else {
      setDbError(null);
    }
    setExpenses((data ?? []).map(fromRow));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchExpenses();

    const channel = supabase
      .channel(`expenses:${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${userId}` },
        fetchExpenses
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId, fetchExpenses]);

  const addExpense = async (expense) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert(toRow(expense, userId))
      .select()
      .single();
    if (error) {
      console.error('[GastoLens] Error al guardar gasto:', error.message, error);
      setDbError(error.message);
      return false;
    }
    if (data) {
      setExpenses(prev => [fromRow(data), ...prev]);
      setDbError(null);
    }
    return true;
  };

  const deleteExpense = async (id) => {
    await supabase.from('expenses').delete().eq('id', id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const clearAll = async () => {
    await supabase.from('expenses').delete().eq('user_id', userId);
    setExpenses([]);
  };

  const now = new Date();
  const todayTotal = sum(expenses, startOfDay(now));
  const weekTotal  = sum(expenses, startOfWeek(now));
  const monthTotal = sum(expenses, startOfMonth(now));

  return { expenses, loading, dbError, addExpense, deleteExpense, clearAll, todayTotal, weekTotal, monthTotal };
}

function sum(expenses, since) {
  return expenses
    .filter(e => new Date(e.date) >= since)
    .reduce((acc, e) => acc + e.amount, 0);
}
