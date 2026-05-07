package com.gourmet.kitchen;

import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

public class HibernateUtil {
    private static final SessionFactory SESSION_FACTORY = buildSessionFactory();

    private static SessionFactory buildSessionFactory() {
        String host   = System.getenv().getOrDefault("DB_HOST", "localhost");
        String port   = System.getenv().getOrDefault("DB_PORT", "5432");
        String dbName = System.getenv().getOrDefault("DB_NAME", "kitchendb");
        String user   = System.getenv().getOrDefault("DB_USER", "postgres");
        String pass   = System.getenv().getOrDefault("DB_PASS", "postgres");

        Configuration cfg = new Configuration();
        cfg.setProperty("hibernate.connection.driver_class", "org.postgresql.Driver");
        cfg.setProperty("hibernate.connection.url", "jdbc:postgresql://" + host + ":" + port + "/" + dbName);
        cfg.setProperty("hibernate.connection.username", user);
        cfg.setProperty("hibernate.connection.password", pass);
        cfg.setProperty("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        cfg.setProperty("hibernate.hbm2ddl.auto", "update");
        cfg.setProperty("hibernate.show_sql", "false");
        cfg.addAnnotatedClass(TicketEntity.class);
        return cfg.buildSessionFactory();
    }

    public static SessionFactory getSessionFactory() { return SESSION_FACTORY; }
}
