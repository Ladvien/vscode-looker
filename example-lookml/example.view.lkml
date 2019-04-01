view: {

    derived_table: {
        sql: SELECT ${client.id}, id FROM users 
                WHERE id = 10 
                LIMIT 10;;
        indexes: ["id"]
    }

    measure: count {
        type: count
        drill_fields: [detail*]
    }

    dimension: id {
        type: number
        sql: ${TABLE}.id ;;
    }
    
}