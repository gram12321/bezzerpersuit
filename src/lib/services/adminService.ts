import { getAllQuestionsForAdmin, deleteQuestionById } from "@/database/adminDB"
import type { Question } from "@/lib/utils/types"

export async function removeQuestion(questionId: string): Promise<Question[]> {
  await deleteQuestionById(questionId)
  return await getAllQuestionsForAdmin()
}

export { getAllQuestionsForAdmin, getAdminQuestionStats, updateQuestion, type AdminQuestionStats } from "@/database/adminDB"
