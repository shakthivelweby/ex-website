import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function Popup({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
  showCloseButton = true,
  maxHeight = "max-h-[80vh]", // Default max height
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`${maxWidth} w-full transform rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col`}
              >
                {title && (
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 p-6 pb-2"
                  >
                    {title}
                  </Dialog.Title>
                )}

                <div className={`flex-1 overflow-y-auto ${maxHeight} p-6 pt-2`}>
                  {children}
                </div>

                {showCloseButton && (
                  <div className="mt-4 p-6 pt-0">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-full border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={onClose}
                    >
                      Close
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
