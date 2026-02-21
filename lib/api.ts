import axios from "axios";

export const executeCode = async (language: string, sourceCode: string) => {
  const response = await axios.post("/api/execute", {
    language,
    sourceCode,
  });
  return response.data;
};
