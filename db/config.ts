import { defineDb, defineTable, column } from 'astro:db';

const Comment = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    email: column.text({ optional: true }),
    message: column.text(),
    approved: column.boolean({ default: false }),
    createdAt: column.date({ default: new Date() }),
  },
});

export default defineDb({ tables: { Comment } });