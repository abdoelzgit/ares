import { toast } from "sonner";

export const notify = {
    success: (message:String) => toast.success(message),
    error: (message:String) => toast.error(message),
    formActionResult: (
        result: {succes: boolean; error?: string},
        successMessage = "Berhasil Disimpan"
    ) => {
        if (result.succes){
            toast.success(successMessage)
        } else {
            toast.error(result.error || "Terjadi Kesalahan")
        }
    } 
}