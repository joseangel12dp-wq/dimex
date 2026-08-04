"use client";

/**
 * Botón para eliminar (solo dueño). Pide confirmación antes de enviar el
 * formulario a la acción de servidor. Reutilizable en todas las secciones.
 */
export default function DeleteButton({
  action,
  id,
  confirmMsg,
  label = "Eliminar",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  confirmMsg: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMsg)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-sm font-semibold text-accent hover:underline cursor-pointer"
      >
        {label}
      </button>
    </form>
  );
}
