export const EXAMPLE_SCHEMAS = {
  ecommerce: {
    id: 'example-ecommerce',
    name: 'E-Commerce Store',
    dialect: 'mysql',
    tables: [
      { id: 't_ec_users', name: 'users', color: 'blue', position: { x: 80, y: 80 }, columns: [
        { id: 'c_eu_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_eu_email', name: 'email', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_eu_name', name: 'name', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: true, unique: false, defaultValue: '' },
        { id: 'c_eu_created', name: 'created_at', type: 'TIMESTAMP', primaryKey: false, autoIncrement: false, nullable: true, unique: false, defaultValue: 'CURRENT_TIMESTAMP' },
      ]},
      { id: 't_ec_categories', name: 'categories', color: 'green', position: { x: 80, y: 340 }, columns: [
        { id: 'c_ec_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_ec_name', name: 'name', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
      ]},
      { id: 't_ec_products', name: 'products', color: 'purple', position: { x: 460, y: 80 }, columns: [
        { id: 'c_ep_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_ep_cat', name: 'category_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: true, unique: false, defaultValue: '' },
        { id: 'c_ep_name', name: 'name', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_ep_price', name: 'price', type: 'DECIMAL(10,2)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_ep_stock', name: 'stock', type: 'INT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '0' },
      ]},
      { id: 't_ec_orders', name: 'orders', color: 'orange', position: { x: 460, y: 380 }, columns: [
        { id: 'c_eo_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_eo_uid', name: 'user_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_eo_status', name: 'status', type: 'VARCHAR(50)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: 'pending' },
        { id: 'c_eo_total', name: 'total', type: 'DECIMAL(10,2)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_eo_created', name: 'created_at', type: 'TIMESTAMP', primaryKey: false, autoIncrement: false, nullable: true, unique: false, defaultValue: 'CURRENT_TIMESTAMP' },
      ]},
      { id: 't_ec_order_items', name: 'order_items', color: 'red', position: { x: 840, y: 380 }, columns: [
        { id: 'c_ei_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_ei_oid', name: 'order_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_ei_pid', name: 'product_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_ei_qty', name: 'quantity', type: 'INT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '1' },
        { id: 'c_ei_price', name: 'unit_price', type: 'DECIMAL(10,2)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
      ]},
      { id: 't_ec_payments', name: 'payments', color: 'gray', position: { x: 840, y: 80 }, columns: [
        { id: 'c_epay_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_epay_oid', name: 'order_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_epay_method', name: 'method', type: 'VARCHAR(50)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_epay_amount', name: 'amount', type: 'DECIMAL(10,2)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_epay_status', name: 'status', type: 'VARCHAR(50)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: 'pending' },
      ]},
    ],
    relationships: [
      { id: 'r_ec1', sourceTableId: 't_ec_products', sourceColumnId: 'c_ep_cat', targetTableId: 't_ec_categories', targetColumnId: 'c_ec_id', type: 'one-to-many', onDelete: 'SET NULL', onUpdate: 'CASCADE', label: '' },
      { id: 'r_ec2', sourceTableId: 't_ec_orders', sourceColumnId: 'c_eo_uid', targetTableId: 't_ec_users', targetColumnId: 'c_eu_id', type: 'one-to-many', onDelete: 'CASCADE', onUpdate: 'CASCADE', label: '' },
      { id: 'r_ec3', sourceTableId: 't_ec_order_items', sourceColumnId: 'c_ei_oid', targetTableId: 't_ec_orders', targetColumnId: 'c_eo_id', type: 'one-to-many', onDelete: 'CASCADE', onUpdate: 'CASCADE', label: '' },
      { id: 'r_ec4', sourceTableId: 't_ec_order_items', sourceColumnId: 'c_ei_pid', targetTableId: 't_ec_products', targetColumnId: 'c_ep_id', type: 'one-to-many', onDelete: 'RESTRICT', onUpdate: 'CASCADE', label: '' },
      { id: 'r_ec5', sourceTableId: 't_ec_payments', sourceColumnId: 'c_epay_oid', targetTableId: 't_ec_orders', targetColumnId: 'c_eo_id', type: 'one-to-one', onDelete: 'CASCADE', onUpdate: 'CASCADE', label: '' },
    ],
  },

  blog: {
    id: 'example-blog',
    name: 'Blog Platform',
    dialect: 'mysql',
    tables: [
      { id: 't_bl_users', name: 'users', color: 'blue', position: { x: 80, y: 80 }, columns: [
        { id: 'c_bu_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_bu_email', name: 'email', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_bu_username', name: 'username', type: 'VARCHAR(100)', primaryKey: false, autoIncrement: false, nullable: false, unique: true, defaultValue: '' },
      ]},
      { id: 't_bl_posts', name: 'posts', color: 'purple', position: { x: 460, y: 80 }, columns: [
        { id: 'c_bp_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_bp_uid', name: 'author_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_bp_title', name: 'title', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_bp_body', name: 'body', type: 'TEXT', primaryKey: false, autoIncrement: false, nullable: true, unique: false, defaultValue: '' },
        { id: 'c_bp_pub', name: 'published_at', type: 'TIMESTAMP', primaryKey: false, autoIncrement: false, nullable: true, unique: false, defaultValue: '' },
      ]},
      { id: 't_bl_comments', name: 'comments', color: 'green', position: { x: 840, y: 80 }, columns: [
        { id: 'c_bc_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_bc_pid', name: 'post_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_bc_uid', name: 'user_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_bc_body', name: 'body', type: 'TEXT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
      ]},
      { id: 't_bl_tags', name: 'tags', color: 'orange', position: { x: 80, y: 360 }, columns: [
        { id: 'c_bt_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_bt_name', name: 'name', type: 'VARCHAR(100)', primaryKey: false, autoIncrement: false, nullable: false, unique: true, defaultValue: '' },
      ]},
      { id: 't_bl_post_tags', name: 'post_tags', color: 'gray', position: { x: 460, y: 360 }, columns: [
        { id: 'c_bpt_pid', name: 'post_id', type: 'INT', primaryKey: true, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_bpt_tid', name: 'tag_id', type: 'INT', primaryKey: true, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
      ]},
    ],
    relationships: [
      { id: 'r_bl1', sourceTableId: 't_bl_posts', sourceColumnId: 'c_bp_uid', targetTableId: 't_bl_users', targetColumnId: 'c_bu_id', type: 'one-to-many', onDelete: 'CASCADE', onUpdate: 'CASCADE', label: '' },
      { id: 'r_bl2', sourceTableId: 't_bl_comments', sourceColumnId: 'c_bc_pid', targetTableId: 't_bl_posts', targetColumnId: 'c_bp_id', type: 'one-to-many', onDelete: 'CASCADE', onUpdate: 'CASCADE', label: '' },
      { id: 'r_bl3', sourceTableId: 't_bl_comments', sourceColumnId: 'c_bc_uid', targetTableId: 't_bl_users', targetColumnId: 'c_bu_id', type: 'one-to-many', onDelete: 'CASCADE', onUpdate: 'CASCADE', label: '' },
      { id: 'r_bl4', sourceTableId: 't_bl_post_tags', sourceColumnId: 'c_bpt_pid', targetTableId: 't_bl_posts', targetColumnId: 'c_bp_id', type: 'one-to-many', onDelete: 'CASCADE', onUpdate: 'CASCADE', label: '' },
      { id: 'r_bl5', sourceTableId: 't_bl_post_tags', sourceColumnId: 'c_bpt_tid', targetTableId: 't_bl_tags', targetColumnId: 'c_bt_id', type: 'one-to-many', onDelete: 'CASCADE', onUpdate: 'CASCADE', label: '' },
    ],
  },

  university: {
    id: 'example-university',
    name: 'University System',
    dialect: 'mysql',
    tables: [
      { id: 't_un_depts', name: 'departments', color: 'blue', position: { x: 80, y: 80 }, columns: [
        { id: 'c_ud_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_ud_name', name: 'name', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
      ]},
      { id: 't_un_instructors', name: 'instructors', color: 'green', position: { x: 80, y: 320 }, columns: [
        { id: 'c_ui_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_ui_did', name: 'department_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: true, unique: false, defaultValue: '' },
        { id: 'c_ui_name', name: 'name', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_ui_email', name: 'email', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: false, unique: true, defaultValue: '' },
      ]},
      { id: 't_un_courses', name: 'courses', color: 'purple', position: { x: 460, y: 80 }, columns: [
        { id: 'c_uc_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_uc_did', name: 'department_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: true, unique: false, defaultValue: '' },
        { id: 'c_uc_iid', name: 'instructor_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: true, unique: false, defaultValue: '' },
        { id: 'c_uc_title', name: 'title', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_uc_credits', name: 'credits', type: 'INT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '3' },
      ]},
      { id: 't_un_students', name: 'students', color: 'orange', position: { x: 460, y: 340 }, columns: [
        { id: 'c_us_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_us_name', name: 'name', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_us_email', name: 'email', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: false, unique: true, defaultValue: '' },
      ]},
      { id: 't_un_enrollments', name: 'enrollments', color: 'gray', position: { x: 840, y: 200 }, columns: [
        { id: 'c_ue_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_ue_sid', name: 'student_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_ue_cid', name: 'course_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_ue_grade', name: 'grade', type: 'VARCHAR(5)', primaryKey: false, autoIncrement: false, nullable: true, unique: false, defaultValue: '' },
      ]},
    ],
    relationships: [
      { id: 'r_un1', sourceTableId: 't_un_instructors', sourceColumnId: 'c_ui_did', targetTableId: 't_un_depts', targetColumnId: 'c_ud_id', type: 'one-to-many', onDelete: 'SET NULL', onUpdate: 'CASCADE', label: '' },
      { id: 'r_un2', sourceTableId: 't_un_courses', sourceColumnId: 'c_uc_did', targetTableId: 't_un_depts', targetColumnId: 'c_ud_id', type: 'one-to-many', onDelete: 'SET NULL', onUpdate: 'CASCADE', label: '' },
      { id: 'r_un3', sourceTableId: 't_un_courses', sourceColumnId: 'c_uc_iid', targetTableId: 't_un_instructors', targetColumnId: 'c_ui_id', type: 'one-to-many', onDelete: 'SET NULL', onUpdate: 'CASCADE', label: '' },
      { id: 'r_un4', sourceTableId: 't_un_enrollments', sourceColumnId: 'c_ue_sid', targetTableId: 't_un_students', targetColumnId: 'c_us_id', type: 'one-to-many', onDelete: 'CASCADE', onUpdate: 'CASCADE', label: '' },
      { id: 'r_un5', sourceTableId: 't_un_enrollments', sourceColumnId: 'c_ue_cid', targetTableId: 't_un_courses', targetColumnId: 'c_uc_id', type: 'one-to-many', onDelete: 'CASCADE', onUpdate: 'CASCADE', label: '' },
    ],
  },

  hospital: {
    id: 'example-hospital',
    name: 'Hospital Management',
    dialect: 'mysql',
    tables: [
      { id: 't_ho_depts', name: 'departments', color: 'blue', position: { x: 80, y: 80 }, columns: [
        { id: 'c_hd_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_hd_name', name: 'name', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
      ]},
      { id: 't_ho_doctors', name: 'doctors', color: 'green', position: { x: 80, y: 300 }, columns: [
        { id: 'c_hdr_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_hdr_did', name: 'department_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: true, unique: false, defaultValue: '' },
        { id: 'c_hdr_name', name: 'name', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_hdr_spec', name: 'specialization', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: true, unique: false, defaultValue: '' },
      ]},
      { id: 't_ho_patients', name: 'patients', color: 'purple', position: { x: 460, y: 80 }, columns: [
        { id: 'c_hp_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_hp_name', name: 'name', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_hp_dob', name: 'date_of_birth', type: 'DATE', primaryKey: false, autoIncrement: false, nullable: true, unique: false, defaultValue: '' },
        { id: 'c_hp_email', name: 'email', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: true, unique: true, defaultValue: '' },
      ]},
      { id: 't_ho_appointments', name: 'appointments', color: 'orange', position: { x: 460, y: 360 }, columns: [
        { id: 'c_ha_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_ha_pid', name: 'patient_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_ha_did', name: 'doctor_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_ha_dt', name: 'appointment_date', type: 'DATETIME', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_ha_status', name: 'status', type: 'VARCHAR(50)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: 'scheduled' },
      ]},
      { id: 't_ho_medications', name: 'medications', color: 'gray', position: { x: 840, y: 80 }, columns: [
        { id: 'c_hm_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_hm_name', name: 'name', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_hm_dosage', name: 'dosage', type: 'VARCHAR(100)', primaryKey: false, autoIncrement: false, nullable: true, unique: false, defaultValue: '' },
      ]},
      { id: 't_ho_prescriptions', name: 'prescriptions', color: 'red', position: { x: 840, y: 360 }, columns: [
        { id: 'c_hpr_id', name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' },
        { id: 'c_hpr_aid', name: 'appointment_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_hpr_mid', name: 'medication_id', type: 'INT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '' },
        { id: 'c_hpr_qty', name: 'quantity', type: 'INT', primaryKey: false, autoIncrement: false, nullable: false, unique: false, defaultValue: '1' },
      ]},
    ],
    relationships: [
      { id: 'r_ho1', sourceTableId: 't_ho_doctors', sourceColumnId: 'c_hdr_did', targetTableId: 't_ho_depts', targetColumnId: 'c_hd_id', type: 'one-to-many', onDelete: 'SET NULL', onUpdate: 'CASCADE', label: '' },
      { id: 'r_ho2', sourceTableId: 't_ho_appointments', sourceColumnId: 'c_ha_pid', targetTableId: 't_ho_patients', targetColumnId: 'c_hp_id', type: 'one-to-many', onDelete: 'CASCADE', onUpdate: 'CASCADE', label: '' },
      { id: 'r_ho3', sourceTableId: 't_ho_appointments', sourceColumnId: 'c_ha_did', targetTableId: 't_ho_doctors', targetColumnId: 'c_hdr_id', type: 'one-to-many', onDelete: 'RESTRICT', onUpdate: 'CASCADE', label: '' },
      { id: 'r_ho4', sourceTableId: 't_ho_prescriptions', sourceColumnId: 'c_hpr_aid', targetTableId: 't_ho_appointments', targetColumnId: 'c_ha_id', type: 'one-to-many', onDelete: 'CASCADE', onUpdate: 'CASCADE', label: '' },
      { id: 'r_ho5', sourceTableId: 't_ho_prescriptions', sourceColumnId: 'c_hpr_mid', targetTableId: 't_ho_medications', targetColumnId: 'c_hm_id', type: 'one-to-many', onDelete: 'RESTRICT', onUpdate: 'CASCADE', label: '' },
    ],
  },
};
