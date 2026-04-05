CREATE TABLE items (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       tipo ENUM('hq','livro') DEFAULT 'hq',
                       nome VARCHAR(255) NOT NULL,
                       volume VARCHAR(50) NULL,
                       editora VARCHAR(255) NULL,
                       valor DECIMAL(10,2) NULL,
                       autor VARCHAR(255) NULL,
                       isbn VARCHAR(50) NULL,
                       idioma VARCHAR(50) NULL,
                       status ENUM('na_estante','vendido','desejado') NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);