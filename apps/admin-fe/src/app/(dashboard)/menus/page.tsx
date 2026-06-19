'use client';

import { FormEvent, useState } from 'react';
import type { CreateMenuRequest, Menu, UpdateMenuRequest } from '@table-order/shared-types';
import { useCategories } from '@/lib/queries/category';
import {
  useCreateMenu,
  useDeleteMenu,
  useMenus,
  useUpdateMenu,
} from '@/lib/queries/menu';
import { toAbsoluteImageUrl, useUploadImage } from '@/lib/queries/image';

interface FormState {
  categoryId: number | '';
  name: string;
  price: string;
  description: string;
  imageUrl: string;
}

const EMPTY_FORM: FormState = {
  categoryId: '',
  name: '',
  price: '',
  description: '',
  imageUrl: '',
};

export default function MenusPage(): JSX.Element {
  const categories = useCategories();
  const menus = useMenus();
  const createMenu = useCreateMenu();
  const updateMenu = useUpdateMenu();
  const deleteMenu = useDeleteMenu();
  const uploadImage = useUploadImage();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const reset = (): void => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (m: Menu): void => {
    setEditingId(m.id);
    setForm({
      categoryId: m.categoryId,
      name: m.name,
      price: String(m.price),
      description: m.description ?? '',
      imageUrl: m.imageUrl ?? '',
    });
  };

  const onImage = async (file: File | undefined): Promise<void> => {
    if (!file) return;
    setError(null);
    try {
      const res = await uploadImage.mutateAsync(file);
      setForm((f) => ({ ...f, imageUrl: res.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드 실패');
    }
  };

  const onSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    if (form.categoryId === '' || !form.name || !form.price) {
      setError('카테고리/이름/가격은 필수입니다');
      return;
    }
    try {
      if (editingId === null) {
        const payload: CreateMenuRequest = {
          categoryId: Number(form.categoryId),
          name: form.name.trim(),
          price: Number(form.price),
          description: form.description.trim() || undefined,
          imageUrl: form.imageUrl.trim() || undefined,
        };
        await createMenu.mutateAsync(payload);
      } else {
        const payload: UpdateMenuRequest = {
          categoryId: Number(form.categoryId),
          name: form.name.trim(),
          price: Number(form.price),
          description: form.description.trim() || null,
          imageUrl: form.imageUrl.trim() || null,
        };
        await updateMenu.mutateAsync({ id: editingId, dto: payload });
      }
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패');
    }
  };

  const onDelete = async (id: number): Promise<void> => {
    if (!window.confirm('메뉴를 삭제하시겠습니까?')) return;
    setError(null);
    try {
      await deleteMenu.mutateAsync(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 실패');
    }
  };

  return (
    <main className="p-6">
      <h2 className="text-xl font-semibold" data-testid="menus-title">
        메뉴 관리
      </h2>

      <form
        onSubmit={onSubmit}
        className="mt-4 grid grid-cols-1 gap-3 rounded-md border border-slate-200 bg-white p-4 md:grid-cols-2"
        data-testid="menu-form"
      >
        <label className="text-sm">
          카테고리
          <select
            value={form.categoryId}
            onChange={(e) =>
              setForm({ ...form, categoryId: e.target.value === '' ? '' : Number(e.target.value) })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            data-testid="menu-form-category"
          >
            <option value="">선택</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          이름
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            data-testid="menu-form-name"
          />
        </label>
        <label className="text-sm">
          가격 (KRW)
          <input
            type="number"
            min={1}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            data-testid="menu-form-price"
          />
        </label>
        <label className="text-sm">
          이미지
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => onImage(e.target.files?.[0])}
            className="mt-1 w-full text-sm"
            data-testid="menu-form-image"
          />
          {form.imageUrl && (
            <img
              src={toAbsoluteImageUrl(form.imageUrl) ?? ''}
              alt=""
              className="mt-2 h-16 w-16 rounded-md border border-slate-200 object-cover"
            />
          )}
        </label>
        <label className="text-sm md:col-span-2">
          설명
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            data-testid="menu-form-description"
          />
        </label>
        <div className="md:col-span-2 flex items-center gap-2">
          <button
            type="submit"
            disabled={createMenu.isPending || updateMenu.isPending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:bg-slate-300"
            data-testid="menu-form-submit"
          >
            {editingId === null ? '추가' : '수정'}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm"
            >
              취소
            </button>
          )}
        </div>
      </form>

      {error && (
        <p className="mt-2 text-sm text-red-600" data-testid="menus-error">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-2">이미지</th>
              <th className="px-4 py-2">이름</th>
              <th className="px-4 py-2">카테고리</th>
              <th className="px-4 py-2 text-right">가격</th>
              <th className="px-4 py-2 text-center">순서</th>
              <th className="px-4 py-2 text-right">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {menus.isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  불러오는 중...
                </td>
              </tr>
            )}
            {menus.data?.length === 0 && !menus.isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  등록된 메뉴가 없습니다
                </td>
              </tr>
            )}
            {menus.data?.map((m) => {
              const cat = categories.data?.find((c) => c.id === m.categoryId);
              return (
                <tr key={m.id} data-testid={`menu-row-${m.id}`}>
                  <td className="px-4 py-2">
                    {m.imageUrl ? (
                      <img
                        src={toAbsoluteImageUrl(m.imageUrl) ?? ''}
                        alt=""
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{m.name}</td>
                  <td className="px-4 py-2 text-slate-600">{cat?.name ?? `#${m.categoryId}`}</td>
                  <td className="px-4 py-2 text-right">₩{m.price.toLocaleString('ko-KR')}</td>
                  <td className="px-4 py-2 text-center text-slate-500">{m.sortOrder}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => startEdit(m)}
                      className="mr-2 rounded-md border border-slate-300 px-3 py-1"
                      data-testid={`menu-edit-${m.id}`}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(m.id)}
                      className="rounded-md border border-red-300 px-3 py-1 text-red-600"
                      data-testid={`menu-delete-${m.id}`}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
