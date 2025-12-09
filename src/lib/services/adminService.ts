import { getAllQuestionsForAdmin, deleteQuestionById } from "@/database/adminDB"
import { supabase } from "@/database/supabase"
import type { Question } from "@/lib/utils"

export async function removeQuestion(questionId: string): Promise<Question[]> {
  await deleteQuestionById(questionId)
  return await getAllQuestionsForAdmin()
}

export async function deleteAllUsers(): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('delete_all_users_except_current')
    
    if (error) {
      console.error('Error deleting users:', error)
      return { success: false, deletedCount: 0, error: error.message }
    }

    const deletedCount = data?.[0]?.deleted_count || 0
    return { success: true, deletedCount }
  } catch (error) {
    console.error('Error deleting users:', error)
    return { success: false, deletedCount: 0, error: 'Failed to delete users' }
  }
}

export { getAllQuestionsForAdmin, getAdminQuestionStats, updateQuestion, type AdminQuestionStats } from "@/database/adminDB"
