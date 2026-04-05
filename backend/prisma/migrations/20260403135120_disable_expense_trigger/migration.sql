-- Disable the expense trigger to prevent null constraint violations during seeding
ALTER TABLE "Order" DISABLE TRIGGER trg_record_expense;