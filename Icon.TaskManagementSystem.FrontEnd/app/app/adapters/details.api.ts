import { DetailsForTasksSchema, type DetailsForTasks } from "~/types/details.types";
import { api, performRequest } from "./axios";

export const getDetailsForTasks = async () => 
    await performRequest<DetailsForTasks>(api.get("/details/tasks"), DetailsForTasksSchema, 'Details for tasks fetched successfully!', 'Details for tasks fetching failed!');
