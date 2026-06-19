'use client';

import { FormEvent, useState } from 'react';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/lib/queries/category';
import type { Category } from '@table-order/shared-types';

export default function CategoriesPage(): JSX.Element {
  const list = useCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const remove = useDeleteCategory();

  const [name, setName] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onCreate = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({ name: name.trim() });
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성 실패');
    }
  };

  const onUpdate = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!editing) return;
    setError(null);
    try {
      await update.mutateAsync({ id: editing.id, dto: { name: editing.name } });
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '수정 실패');
    }
  };

  const onDelete = async (id: number): Promise<void> => {
    if (!window.confirm('카테고리를 삭제하시겠습니까?')) return;
    setError(null);
    try {
      await remove.mutateAsync(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 실패');
    }
  };

  return (
    <main className="p-6">
      <h2 className="text-xl font-semibold" data-testid="categories-title">
        카테고리 관리
      </h2>

      <form onSubmit={onCreate} className="mt-4 flex gap-2" data-testid="category-create-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="새 카테고리 이름"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          data-testid="category-create-name"
        />
        <button
          type="submit"
          disabled={!name.trim() || create.isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:bg-slate-300"
          data-testid="category-create-submit"
        >
          {create.isPending ? '추가 중...' : '추가'}
        </button>
      </form>

      {error && (
        <p className="mt-2 text-sm text-red-600" data-testid="categories-error">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-2 font-medium text-slate-700">순서</th>
              <th className="px-4 py-2 font-medium text-slate-700">이름</th>
              <th className="px-4 py-2 font-medium text-slate-700 text-right">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {list.isLoading && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                  불러오는 중...
                </td>
              </tr>
            )}
            {list.data?.length === 0 && !list.isLoading && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                  등록된 카테고리가 없습니다
                </td>
              </tr>
            )}
            {list.data?.map((c) => (
              <tr key={c.id} data-testid={`category-row-${c.id}`}>
                <td className="px-4 py-2 text-slate-500">{c.sortOrder}</td>
                <td className="px-4 py-2">
                  {editing?.id === c.id ? (
                    <form onSubmit={onUpdate} className="flex gap-2">
                      <input
                        type="text"
                        value={editing.name}
                        onChange={(e) =>
                          setEditing({ ...editing, name: e.target.value })
                        }
                        className="flex-1 rounded-md border border-slate-300 px-2 py-1"
                        data-testid={`category-edit-name-${c.id}`}
                      />
                      <button
                        type="submit"
                        className="rounded-md bg-slate-900 px-3 py-1 text-white"
                        data-testid={`category-edit-save-${c.id}`}
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="rounded-md border border-slate-300 px-3 py-1"
                      >
                        취소
                      </button>
                    </form>
                  ) : (
                    c.name
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {editing?.id !== c.id && (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditing(c)}
                        className="mr-2 rounded-md border border-slate-300 px-3 py-1"
                        data-testid={`category-edit-${c.id}`}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(c.id)}
                        className="rounded-md border border-red-300 px-3 py-1 text-red-600"
                        data-testid={`category-delete-${c.id}`}
                      >
                        삭제
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
