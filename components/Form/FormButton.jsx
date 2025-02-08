import { MdAddCircle, MdRemoveCircle } from "react-icons/md";

const FormButton = ({ size, remove, add }) => {
  return (
    <div className="flex gap-1 mb-2">
      <button
        type="button"
        onClick={add}
        aria-label="Add"
        className="p-1 text-white bg-[#037ef3] rounded-full text-base hover:bg-[#0366d6] transition-all duration-300 shadow-sm"
      >
        <MdAddCircle />
      </button>
      {size > 0 && (
        <button
          type="button"
          onClick={remove}
          aria-label="Remove"
          className="p-1 text-white bg-[#037ef3] rounded-full text-base hover:bg-[#0366d6] transition-all duration-300 shadow-sm"
        >
          <MdRemoveCircle />
        </button>
      )}
    </div>
  );
};

export default FormButton;
