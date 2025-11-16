DROP TABLE IF EXISTS `documentsData`;
CREATE TABLE `documentsData` (
  `id` TEXT PRIMARY KEY,
  `name` TEXT,
  `workflow` TEXT,
  `type` TEXT,
  `uploadedBy` TEXT,
  `uploadedDate` TEXT,
  `size` TEXT,
  `status` TEXT
);

DROP TABLE IF EXISTS `tasksData`;
CREATE TABLE `tasksData` (
  `id` TEXT PRIMARY KEY,
  `title` TEXT,
  `workflow` TEXT,
  `phase` TEXT,
  `assignee` TEXT,
  `priority` TEXT,
  `status` TEXT,
  `dueDate` TEXT,
  `createdDate` TEXT
);

DROP TABLE IF EXISTS `templatesData`;
CREATE TABLE `templatesData` (
  `id` TEXT PRIMARY KEY,
  `name` TEXT,
  `description` TEXT,
  `phases` BIGINT,
  `avgDuration` TEXT,
  `usageCount` BIGINT,
  `status` TEXT,
  `requiredRoles` JSON
);

DROP TABLE IF EXISTS `workflowsData`;
CREATE TABLE `workflowsData` (
  `id` TEXT PRIMARY KEY,
  `name` TEXT,
  `template` TEXT,
  `status` TEXT,
  `progress` BIGINT,
  `currentPhase` TEXT,
  `assignee` TEXT,
  `startDate` TEXT,
  `dueDate` TEXT,
  `priority` TEXT
);

